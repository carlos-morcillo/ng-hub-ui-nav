import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HubNavMobilePanelComponent } from './nav-mobile-panel.component';
import { HubNavItem } from '../../models/nav-item.model';

describe('HubNavMobilePanelComponent', () => {
	let component: HubNavMobilePanelComponent;
	let componentRef: ComponentRef<HubNavMobilePanelComponent>;
	let fixture: ComponentFixture<HubNavMobilePanelComponent>;

	const items: HubNavItem[] = [
		{ id: 'overview', label: 'Overview', type: 'link', route: '/docs/overview' },
		{
			id: 'examples',
			label: 'Examples',
			type: 'dropdown',
			route: '/docs/examples',
			children: [{ id: 'basic', label: 'Basic', type: 'link', route: '/docs/examples', fragment: 'basic' }]
		}
	];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavMobilePanelComponent],
			providers: [provideRouter([])]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavMobilePanelComponent);
		component = fixture.componentInstance;
		componentRef = fixture.componentRef;
		componentRef.setInput('items', items);
		componentRef.setInput('isOpen', true);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the panel after clicking a routable link item', () => {
		const closeSpy = vi.fn();
		component.closePanel.subscribe(closeSpy);

		component.onItemClick({ item: items[0], event: new MouseEvent('click') });

		expect(closeSpy).toHaveBeenCalled();
	});

	it('should close the panel after clicking the route area of a dropdown item', () => {
		const closeSpy = vi.fn();
		component.closePanel.subscribe(closeSpy);

		component.onItemClick({ item: items[1], event: new MouseEvent('click') });

		expect(closeSpy).toHaveBeenCalled();
	});
});
