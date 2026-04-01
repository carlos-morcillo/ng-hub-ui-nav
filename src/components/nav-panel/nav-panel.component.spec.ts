import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HubNavPanelComponent } from './nav-panel.component';
import { HubNavStateService } from '../../services/nav-state.service';
import { HubNavPanelState } from '../../models/nav-panel-state.model';

describe('HubNavPanelComponent', () => {
	let component: HubNavPanelComponent;
	let componentRef: ComponentRef<HubNavPanelComponent>;
	let fixture: ComponentFixture<HubNavPanelComponent>;

	const mockPanel: HubNavPanelState = {
		id: 'panel-1',
		parentItem: {
			id: 'docs',
			label: 'Documentation',
			type: 'dropdown',
			children: [
				{ id: 'getting-started', label: 'Getting Started', type: 'link', route: '/docs/start' },
				{ id: 'api', label: 'API Reference', type: 'link', route: '/docs/api' }
			]
		},
		items: [
			{ id: 'getting-started', label: 'Getting Started', type: 'link', route: '/docs/start' },
			{ id: 'api', label: 'API Reference', type: 'link', route: '/docs/api' }
		],
		history: [],
		isDrillDown: false
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavPanelComponent],
			providers: [HubNavStateService, provideRouter([])]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavPanelComponent);
		component = fixture.componentInstance;
		componentRef = fixture.componentRef;
		componentRef.setInput('panel', mockPanel);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have role navigation', () => {
		expect(fixture.nativeElement.getAttribute('role')).toBe('navigation');
	});

	it('should have aria-label with parent item label', () => {
		expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Documentation navigation');
	});

	it('should display the parent item label in the header', () => {
		const title = fixture.nativeElement.querySelector('.hub-nav-panel__title');
		expect(title.textContent.trim()).toBe('Documentation');
	});

	it('should not show back button when not in drill-down mode', () => {
		const backButton = fixture.nativeElement.querySelector('.hub-nav-panel__back');
		expect(backButton).toBeNull();
	});

	it('should show back button when in drill-down mode', () => {
		const drillDownPanel: HubNavPanelState = { ...mockPanel, isDrillDown: true };
		componentRef.setInput('panel', drillDownPanel);
		fixture.detectChanges();
		const backButton = fixture.nativeElement.querySelector('.hub-nav-panel__back');
		expect(backButton).not.toBeNull();
	});

	it('should emit closePanel when close button is clicked', () => {
		const spy = vi.fn();
		component.closePanel.subscribe(spy);
		const closeButton = fixture.nativeElement.querySelector('.hub-nav-panel__close');
		closeButton.click();
		expect(spy).toHaveBeenCalledWith('panel-1');
	});

	it('should emit backClick when back button is clicked', () => {
		const drillDownPanel: HubNavPanelState = { ...mockPanel, isDrillDown: true };
		componentRef.setInput('panel', drillDownPanel);
		fixture.detectChanges();

		const spy = vi.fn();
		component.backClick.subscribe(spy);
		const backButton = fixture.nativeElement.querySelector('.hub-nav-panel__back');
		backButton.click();
		expect(spy).toHaveBeenCalledWith('panel-1');
	});

	it('should emit closePanel on Escape key', () => {
		const spy = vi.fn();
		component.closePanel.subscribe(spy);
		fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(spy).toHaveBeenCalledWith('panel-1');
	});

	it('should emit closePanel on ArrowLeft when focus is inside the direct panel list', () => {
		const spy = vi.fn();
		component.closePanel.subscribe(spy);
		const directList = fixture.nativeElement.querySelector('hub-nav-item-list') as HTMLElement;
		const fakeItem = document.createElement('button');
		directList.appendChild(fakeItem);

		fixture.nativeElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
		);

		// Dispatch from the nested target to exercise the direct-list ownership check.
		fakeItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		expect(spy).toHaveBeenCalledWith('panel-1');
	});

	it('should render item-list with panel items', () => {
		const itemList = fixture.nativeElement.querySelector('hub-nav-item-list');
		expect(itemList).not.toBeNull();
	});

	it('should apply drill-down host class when isDrillDown is true', () => {
		const drillDownPanel: HubNavPanelState = { ...mockPanel, isDrillDown: true };
		componentRef.setInput('panel', drillDownPanel);
		fixture.detectChanges();
		expect(fixture.nativeElement.classList.contains('hub-nav-panel--drill-down')).toBe(true);
	});
});
