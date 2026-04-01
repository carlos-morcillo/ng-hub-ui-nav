import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { HubNavTogglerComponent } from './nav-toggler.component';

describe('HubNavTogglerComponent', () => {
	let component: HubNavTogglerComponent;
	let componentRef: ComponentRef<HubNavTogglerComponent>;
	let fixture: ComponentFixture<HubNavTogglerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavTogglerComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavTogglerComponent);
		component = fixture.componentInstance;
		componentRef = fixture.componentRef;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should default isOpen to false', () => {
		expect(component.isOpen()).toBe(false);
	});

	it('should have aria-expanded false by default', () => {
		const button = fixture.nativeElement.querySelector('button');
		expect(button.getAttribute('aria-expanded')).toBe('false');
	});

	it('should update aria-expanded when isOpen changes', () => {
		componentRef.setInput('isOpen', true);
		fixture.detectChanges();
		const button = fixture.nativeElement.querySelector('button');
		expect(button.getAttribute('aria-expanded')).toBe('true');
	});

	it('should have aria-label for accessibility', () => {
		const button = fixture.nativeElement.querySelector('button');
		expect(button.getAttribute('aria-label')).toBe('Toggle navigation');
	});

	it('should emit toggle on button click', () => {
		const spy = vi.fn();
		component.toggle.subscribe(spy);
		const button = fixture.nativeElement.querySelector('button');
		button.click();
		expect(spy).toHaveBeenCalled();
	});

	it('should apply open class when isOpen is true', () => {
		componentRef.setInput('isOpen', true);
		fixture.detectChanges();
		const button = fixture.nativeElement.querySelector('button');
		expect(button.classList.contains('hub-nav-toggler__button--open')).toBe(true);
	});

	it('should render three bars', () => {
		const bars = fixture.nativeElement.querySelectorAll('.hub-nav-toggler__bar');
		expect(bars.length).toBe(3);
	});
});
