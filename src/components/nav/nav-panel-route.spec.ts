import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavComponent } from './nav.component';

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

/**
 * Opening the panel stack from the route, in the shape a documentation sidebar uses: a
 * library root whose own route is its overview tab, sibling tabs beside it, and one tab
 * that itself has children (the in-page example anchors).
 *
 * The reason this needs its own suite is that the existing route-sync coverage is all
 * `accordion`, which returns early and never touches the panel stack. `panel` mode is the
 * branch a sidebar actually runs, and it was uncovered.
 */
describe('HubNavComponent panel mode opening from the route', () => {
	let component: HubNavComponent;
	let componentRef: ComponentRef<HubNavComponent>;
	let fixture: ComponentFixture<HubNavComponent>;

	/** A library root shaped like the docs sidebar: overview route, tabs, examples with anchors. */
	const libraryItems: HubNavItem[] = [
		{ id: 'home', label: 'Home', type: 'link', route: '/en/' },
		{
			id: 'forms',
			label: 'Forms',
			type: 'dropdown',
			route: '/en/forms/overview',
			children: [
				{ id: 'forms-overview', label: 'Overview', type: 'link', route: '/en/forms/overview' },
				{ id: 'forms-api', label: 'API', type: 'link', route: '/en/forms/api' },
				{
					id: 'forms-examples',
					label: 'Examples',
					type: 'dropdown',
					route: '/en/forms/examples',
					children: [
						{
							id: 'forms-example-a',
							label: 'First',
							type: 'link',
							route: '/en/forms/examples',
							fragment: 'forms-input-basic'
						},
						{
							id: 'forms-example-b',
							label: 'Second',
							type: 'link',
							route: '/en/forms/examples',
							fragment: 'forms-select-addons'
						}
					]
				}
			]
		},
		{ id: 'icons', label: 'Icons', type: 'dropdown', route: '/en/icons/overview', children: [] }
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
		// The rail only reads the URL; the catch-all lets the router resolve anything.
		TestBed.inject(Router).resetConfig([{ path: '**', children: [] }]);
	});

	/** Applies the docs-sidebar configuration and settles the fixture. */
	async function arrange(url: string): Promise<void> {
		componentRef.setInput('items', libraryItems);
		componentRef.setInput('autoOpenFromRoute', true);
		componentRef.setInput('config', {
			orientation: 'vertical',
			verticalExpandMode: 'panel',
			panelMaxVisible: 2
		});
		fixture.detectChanges();

		await TestBed.inject(Router).navigateByUrl(url);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	}

	it('opens a panel for the library holding the active route', async () => {
		await arrange('/en/forms/api');

		expect(component.state.panelCount()).toBeGreaterThan(0);
		expect(component.state.panelStack()[0].parentItem.id).toBe('forms');
	});

	it('drills the panel down to the examples when that tab is the active route', async () => {
		await arrange('/en/forms/examples');

		const ids = component.state.panelStack().flatMap((p) => p.items.map((i) => i.id));
		expect(component.state.panelCount()).toBeGreaterThan(0);
		expect(ids).toContain('forms-example-a');
	});

	/**
	 * The suspect that made this suite worth writing. A host app may serialize routes with a
	 * trailing slash (the docs site does, to keep prerendered URLs canonical), so the URL the
	 * nav reads is `/en/forms/examples/` while the item declares `/en/forms/examples`.
	 */
	it('opens the panel when the active URL carries a trailing slash', async () => {
		await arrange('/en/forms/examples/');

		expect(component.state.panelCount()).toBeGreaterThan(0);
	});

	/** And the fragment the page adds on scroll must not unmark the section either. */
	it('opens the panel when the active URL carries a trailing slash and a fragment', async () => {
		await arrange('/en/forms/examples/#forms-input-basic');

		expect(component.state.panelCount()).toBeGreaterThan(0);
	});

	/**
	 * The nav seeds its URL signal at construction, when the router has usually not resolved
	 * the first navigation yet, and only subscribes to `NavigationEnd` in `ngOnInit` — after
	 * the event that resolved it has already gone by. Landing directly on a deep link left the
	 * signal on whatever the router reported at construction, so every route lookup matched no
	 * item and the sidebar stayed shut on every page load. Nothing threw: an unmatched route
	 * simply closes everything, which is indistinguishable from "nothing to open".
	 */
	it('opens the panel when the route resolved before the component initialised', async () => {
		// Navigate first, then initialise: the NavigationEnd the subscription would have caught
		// has already fired by the time ngOnInit runs.
		await TestBed.inject(Router).navigateByUrl('/en/forms/examples');

		componentRef.setInput('items', libraryItems);
		componentRef.setInput('autoOpenFromRoute', true);
		componentRef.setInput('config', {
			orientation: 'vertical',
			verticalExpandMode: 'panel',
			panelMaxVisible: 2
		});
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(component.state.panelCount()).toBeGreaterThan(0);
	});
});
