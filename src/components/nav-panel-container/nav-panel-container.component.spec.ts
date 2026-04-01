import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HubNavPanelContainerComponent } from './nav-panel-container.component';
import { HubNavStateService } from '../../services/nav-state.service';
import { HubNavPanelState } from '../../models/nav-panel-state.model';

describe('HubNavPanelContainerComponent', () => {
	let component: HubNavPanelContainerComponent;
	let componentRef: ComponentRef<HubNavPanelContainerComponent>;
	let fixture: ComponentFixture<HubNavPanelContainerComponent>;

	const mockPanels: HubNavPanelState[] = [
		{
			id: 'panel-1',
			parentItem: { id: 'docs', label: 'Docs', type: 'dropdown', children: [{ id: 'a', label: 'A', type: 'link' }] },
			items: [{ id: 'a', label: 'A', type: 'link' }],
			history: [],
			isDrillDown: false
		},
		{
			id: 'panel-2',
			parentItem: {
				id: 'comps',
				label: 'Components',
				type: 'dropdown',
				children: [{ id: 'b', label: 'B', type: 'link' }]
			},
			items: [{ id: 'b', label: 'B', type: 'link' }],
			history: [],
			isDrillDown: false
		}
	];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavPanelContainerComponent],
			providers: [HubNavStateService, provideRouter([])]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavPanelContainerComponent);
		component = fixture.componentInstance;
		componentRef = fixture.componentRef;
		componentRef.setInput('panels', mockPanels);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render one hub-nav-panel per panel state', () => {
		const panels = fixture.nativeElement.querySelectorAll('hub-nav-panel');
		expect(panels.length).toBe(2);
	});

	it('should apply left class when sidebarSide is left', () => {
		componentRef.setInput('sidebarSide', 'left');
		fixture.detectChanges();
		expect(fixture.nativeElement.classList.contains('hub-nav-panel-container--left')).toBe(true);
	});

	it('should apply right class when sidebarSide is right', () => {
		componentRef.setInput('sidebarSide', 'right');
		fixture.detectChanges();
		expect(fixture.nativeElement.classList.contains('hub-nav-panel-container--right')).toBe(true);
	});

	it('should render no panels when list is empty', () => {
		componentRef.setInput('panels', []);
		fixture.detectChanges();
		const panels = fixture.nativeElement.querySelectorAll('hub-nav-panel');
		expect(panels.length).toBe(0);
	});
});
