import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HubNavComponent } from './nav.component';
import { HubNavItem } from '../../models/nav-item.model';

/** Mock matchMedia for jsdom environments. */
function mockMatchMedia(): void {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	});
}

describe('HubNavComponent', () => {
	let component: HubNavComponent;
	let componentRef: ComponentRef<HubNavComponent>;
	let fixture: ComponentFixture<HubNavComponent>;

	const testItems: HubNavItem[] = [
		{ id: 'home', label: 'Home', type: 'link', route: '/home' },
		{ id: 'about', label: 'About', type: 'link', route: '/about' },
		{
			id: 'services',
			label: 'Services',
			type: 'dropdown',
			children: [
				{ id: 'web', label: 'Web', type: 'link', route: '/services/web' },
				{ id: 'design', label: 'Design', type: 'link', route: '/services/design' }
			]
		}
	];

	beforeEach(async () => {
		mockMatchMedia();
		await TestBed.configureTestingModule({
			imports: [HubNavComponent],
			providers: [provideRouter([])]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavComponent);
		component = fixture.componentInstance;
		componentRef = fixture.componentRef;
		componentRef.setInput('items', testItems);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('host classes', () => {
		it('should apply horizontal class by default', () => {
			expect(fixture.nativeElement.classList.contains('hub-nav--horizontal')).toBe(true);
			expect(fixture.nativeElement.classList.contains('hub-nav--vertical')).toBe(false);
		});

		it('should apply vertical class when orientation is vertical', () => {
			componentRef.setInput('config', { orientation: 'vertical' });
			fixture.detectChanges();
			expect(fixture.nativeElement.classList.contains('hub-nav--vertical')).toBe(true);
			expect(fixture.nativeElement.classList.contains('hub-nav--horizontal')).toBe(false);
		});

		it('should apply sticky class only when vertical', () => {
			componentRef.setInput('config', { orientation: 'vertical', position: 'sticky' });
			fixture.detectChanges();
			expect(fixture.nativeElement.classList.contains('hub-nav--sticky')).toBe(true);
		});

		it('should keep sticky class when vertical nav is collapsed', () => {
			componentRef.setInput('config', { orientation: 'vertical', position: 'sticky' });
			fixture.detectChanges();
			component.state.setCollapsed(true);
			fixture.detectChanges();
			expect(fixture.nativeElement.classList.contains('hub-nav--sticky')).toBe(true);
		});

		it('should not apply sticky class when horizontal', () => {
			componentRef.setInput('config', { position: 'sticky' });
			fixture.detectChanges();
			expect(fixture.nativeElement.classList.contains('hub-nav--sticky')).toBe(false);
		});

		it('should apply fixed class', () => {
			componentRef.setInput('config', { position: 'fixed' });
			fixture.detectChanges();
			expect(fixture.nativeElement.classList.contains('hub-nav--fixed')).toBe(true);
		});
	});

	describe('resolved config', () => {
		it('should use default config when no overrides provided', () => {
			const config = component.resolvedConfig();
			expect(config.orientation).toBe('horizontal');
			expect(config.dropdownTrigger).toBe('click');
			expect(config.collapseBreakpoint).toBe(992);
		});

		it('should merge config overrides with defaults', () => {
			componentRef.setInput('config', { orientation: 'vertical', dropdownTrigger: 'hover' });
			fixture.detectChanges();
			const config = component.resolvedConfig();
			expect(config.orientation).toBe('vertical');
			expect(config.dropdownTrigger).toBe('hover');
			expect(config.collapseBreakpoint).toBe(992);
		});
	});

	describe('ARIA', () => {
		it('should have default aria label', () => {
			expect(component.ariaLabel()).toBe('Navigation');
		});

		it('should update aria label from config', () => {
			componentRef.setInput('config', { ariaLabel: 'Main Navigation' });
			fixture.detectChanges();
			expect(component.ariaLabel()).toBe('Main Navigation');
		});
	});

	describe('outputs', () => {
		it('should emit itemClick when a link item is clicked', () => {
			const spy = vi.fn();
			component.itemClick.subscribe(spy);
			component.onItemClick({ item: testItems[0], event: new MouseEvent('click') });
			expect(spy).toHaveBeenCalledWith(testItems[0]);
		});

		it('should not emit itemClick for non-link items', () => {
			const spy = vi.fn();
			component.itemClick.subscribe(spy);
			component.onItemClick({ item: testItems[2], event: new MouseEvent('click') });
			expect(spy).not.toHaveBeenCalled();
		});

		it('should emit mobileToggle on mobile toggle', () => {
			const spy = vi.fn();
			component.mobileToggle.subscribe(spy);
			component.onMobileToggle();
			expect(spy).toHaveBeenCalled();
		});

		it('should emit mobileToggle false on panel close', () => {
			const spy = vi.fn();
			component.mobileToggle.subscribe(spy);
			component.onMobilePanelClose();
			expect(spy).toHaveBeenCalledWith(false);
		});
	});

	describe('collapsed state', () => {
		it('should start not collapsed', () => {
			expect(component.isCollapsed()).toBe(false);
		});

		it('should start with mobile panel closed', () => {
			expect(component.isMobileOpen()).toBe(false);
		});
	});
});
