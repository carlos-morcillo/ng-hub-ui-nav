import { TestBed } from '@angular/core/testing';
import { HubNavStateService } from './nav-state.service';
import { HubNavItem } from '../models/nav-item.model';

describe('HubNavStateService', () => {
	let service: HubNavStateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HubNavStateService]
		});
		service = TestBed.inject(HubNavStateService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('config management', () => {
		it('should have default orientation as horizontal', () => {
			expect(service.orientation()).toBe('horizontal');
		});

		it('should update config via setConfig()', () => {
			service.setConfig({
				orientation: 'vertical',
				verticalExpandMode: 'flyout',
				dropdownTrigger: 'hover',
				position: 'sticky',
				stickyTop: '4rem',
				collapseMode: 'dropdown',
				collapseBreakpoint: 768,
				offcanvasPosition: 'end',
				ariaLabel: 'Main',
				panelMaxVisible: 3,
				sidebarSide: 'left',
				panelWidth: '16rem',
				dropdownRenderMode: 'inline'
			});
			expect(service.orientation()).toBe('vertical');
			expect(service.verticalExpandMode()).toBe('flyout');
			expect(service.dropdownTrigger()).toBe('hover');
		});
	});

	describe('dropdown management', () => {
		it('should start with no open dropdowns', () => {
			expect(service.isDropdownOpen('test')).toBe(false);
		});

		it('should open a dropdown', () => {
			service.openDropdown('products');
			expect(service.isDropdownOpen('products')).toBe(true);
		});

		it('should close a dropdown', () => {
			service.openDropdown('products');
			service.closeDropdown('products');
			expect(service.isDropdownOpen('products')).toBe(false);
		});

		it('should toggle a closed dropdown to open', () => {
			const result = service.toggleDropdown('products');
			expect(result).toBe(true);
			expect(service.isDropdownOpen('products')).toBe(true);
		});

		it('should toggle an open dropdown to closed', () => {
			service.openDropdown('products');
			const result = service.toggleDropdown('products');
			expect(result).toBe(false);
			expect(service.isDropdownOpen('products')).toBe(false);
		});

		it('should track multiple open dropdowns independently', () => {
			service.openDropdown('products');
			service.openDropdown('services');
			expect(service.isDropdownOpen('products')).toBe(true);
			expect(service.isDropdownOpen('services')).toBe(true);

			service.closeDropdown('products');
			expect(service.isDropdownOpen('products')).toBe(false);
			expect(service.isDropdownOpen('services')).toBe(true);
		});

		it('should close all dropdowns', () => {
			service.openDropdown('products');
			service.openDropdown('services');
			service.closeAllDropdowns();
			expect(service.isDropdownOpen('products')).toBe(false);
			expect(service.isDropdownOpen('services')).toBe(false);
		});

		it('should synchronize open dropdowns with the active route trail', () => {
			const items: HubNavItem[] = [
				{
					id: 'calendar',
					label: 'Calendar',
					type: 'dropdown',
					children: [
						{ id: 'calendar-overview', label: 'Overview', type: 'link', route: '/calendar/overview' },
						{
							id: 'calendar-examples',
							label: 'Examples',
							type: 'dropdown',
							route: '/calendar/examples',
							children: [
								{
									id: 'calendar-example-basic',
									label: 'Basic',
									type: 'link',
									route: '/calendar/examples',
									fragment: 'calendar-basic'
								}
							]
						}
					]
				}
			];

			service.syncDropdownsWithRoute(items, '/calendar/examples#calendar-basic');

			expect(service.isDropdownOpen('calendar')).toBe(true);
			expect(service.isDropdownOpen('calendar-examples')).toBe(true);
		});
	});

	describe('mobile state', () => {
		it('should start with mobile panel closed', () => {
			expect(service.mobileOpen()).toBe(false);
		});

		it('should set mobile open state', () => {
			service.setMobileOpen(true);
			expect(service.mobileOpen()).toBe(true);
		});

		it('should toggle mobile state', () => {
			service.toggleMobile();
			expect(service.mobileOpen()).toBe(true);
			service.toggleMobile();
			expect(service.mobileOpen()).toBe(false);
		});
	});

	describe('collapsed state', () => {
		it('should start not collapsed', () => {
			expect(service.collapsed()).toBe(false);
		});

		it('should set collapsed state', () => {
			service.setCollapsed(true);
			expect(service.collapsed()).toBe(true);
		});

		it('should close mobile panel when un-collapsing', () => {
			service.setCollapsed(true);
			service.setMobileOpen(true);
			service.setCollapsed(false);
			expect(service.mobileOpen()).toBe(false);
		});

		it('should keep mobile panel open when collapsing', () => {
			service.setMobileOpen(true);
			service.setCollapsed(true);
			expect(service.mobileOpen()).toBe(true);
		});
	});

	describe('panel stack management', () => {
		const parentItem: HubNavItem = {
			id: 'docs',
			label: 'Documentation',
			type: 'dropdown',
			children: [
				{ id: 'getting-started', label: 'Getting Started', type: 'link', route: '/docs/start' },
				{
					id: 'guides',
					label: 'Guides',
					type: 'dropdown',
					children: [
						{ id: 'routing', label: 'Routing', type: 'link', route: '/docs/routing' }
					]
				}
			]
		};

		const parentItem2: HubNavItem = {
			id: 'components',
			label: 'Components',
			type: 'dropdown',
			children: [
				{ id: 'buttons', label: 'Buttons', type: 'link', route: '/components/buttons' }
			]
		};

		it('should start with empty panel stack', () => {
			expect(service.panelStack()).toEqual([]);
			expect(service.panelCount()).toBe(0);
		});

		it('should open a panel for a parent item', () => {
			service.openPanel(parentItem);
			expect(service.panelCount()).toBe(1);
			expect(service.panelStack()[0].parentItem).toBe(parentItem);
			expect(service.panelStack()[0].items).toBe(parentItem.children!);
		});

		it('should not open a panel if item has no children', () => {
			const noChildren: HubNavItem = { id: 'solo', label: 'Solo', type: 'link' };
			service.openPanel(noChildren);
			expect(service.panelCount()).toBe(0);
		});

		it('should close a panel by its ID', () => {
			service.openPanel(parentItem);
			const panelId = service.panelStack()[0].id;
			service.closePanel(panelId);
			expect(service.panelCount()).toBe(0);
		});

		it('should close all panels', () => {
			service.openPanel(parentItem);
			service.openPanel(parentItem2);
			service.closeAllPanels();
			expect(service.panelCount()).toBe(0);
		});

		it('should toggle panel: close if already open for same item', () => {
			service.openPanel(parentItem);
			expect(service.panelCount()).toBe(1);
			service.openPanel(parentItem); // same item → close
			expect(service.panelCount()).toBe(0);
		});

		it('should drill down when max panels reached', () => {
			service.setConfig({
				...service.config(),
				panelMaxVisible: 1
			});
			service.openPanel(parentItem);
			expect(service.panelCount()).toBe(1);

			// Opening another should drill-down in the existing panel
			service.openPanel(parentItem2);
			expect(service.panelCount()).toBe(1);
			expect(service.panelStack()[0].isDrillDown).toBe(true);
			expect(service.panelStack()[0].items).toBe(parentItem2.children!);
		});

		it('should navigate back in drill-down history', () => {
			service.setConfig({
				...service.config(),
				panelMaxVisible: 1
			});
			service.openPanel(parentItem);
			service.openPanel(parentItem2); // drills down
			const panelId = service.panelStack()[0].id;

			service.navigateBackInPanel(panelId);
			expect(service.panelStack()[0].items).toBe(parentItem.children!);
			expect(service.panelStack()[0].isDrillDown).toBe(false);
		});

		it('should close panel if navigating back with no history', () => {
			service.openPanel(parentItem);
			const panelId = service.panelStack()[0].id;
			service.navigateBackInPanel(panelId);
			expect(service.panelCount()).toBe(0);
		});

		it('should find panel by ID', () => {
			service.openPanel(parentItem);
			const panelId = service.panelStack()[0].id;
			const found = service.getPanelById(panelId);
			expect(found).toBeTruthy();
			expect(found?.parentItem).toBe(parentItem);
		});

		it('should return undefined for unknown panel ID', () => {
			expect(service.getPanelById('nonexistent')).toBeUndefined();
		});
	});

	describe('getEffectiveExpandMode()', () => {
		it('should return item expandMode override when set', () => {
			service.setConfig({
				...service.config(),
				orientation: 'vertical'
			});
			const item: HubNavItem = { id: 'test', label: 'Test', type: 'dropdown', expandMode: 'panel' };
			expect(service.getEffectiveExpandMode(item)).toBe('panel');
		});

		it('should fall back to config verticalExpandMode', () => {
			service.setConfig({
				...service.config(),
				orientation: 'vertical',
				verticalExpandMode: 'flyout'
			});
			const item: HubNavItem = { id: 'test', label: 'Test', type: 'dropdown' };
			expect(service.getEffectiveExpandMode(item)).toBe('flyout');
		});

		it('should return accordion for panel mode when collapsed (mobile fallback)', () => {
			service.setConfig({
				...service.config(),
				orientation: 'vertical',
				verticalExpandMode: 'panel'
			});
			service.setCollapsed(true);
			const item: HubNavItem = { id: 'test', label: 'Test', type: 'dropdown' };
			expect(service.getEffectiveExpandMode(item)).toBe('accordion');
		});

		it('should not apply mobile fallback when not collapsed', () => {
			service.setConfig({
				...service.config(),
				orientation: 'vertical',
				verticalExpandMode: 'panel'
			});
			const item: HubNavItem = { id: 'test', label: 'Test', type: 'dropdown' };
			expect(service.getEffectiveExpandMode(item)).toBe('panel');
		});
	});

	describe('isItemOrDescendantActive()', () => {
		const testItems: HubNavItem[] = [
			{ id: 'home', label: 'Home', type: 'link', route: '/home' },
			{
				id: 'services',
				label: 'Services',
				type: 'dropdown',
				children: [
					{ id: 'web', label: 'Web', type: 'link', route: '/services/web' },
					{
						id: 'design',
						label: 'Design',
						type: 'dropdown',
						children: [{ id: 'ui', label: 'UI', type: 'link', route: '/services/design/ui' }]
					}
				]
			}
		];

		it('should return true for a direct route match', () => {
			expect(service.isItemOrDescendantActive(testItems[0], '/home')).toBe(true);
		});

		it('should return false for no match', () => {
			expect(service.isItemOrDescendantActive(testItems[0], '/about')).toBe(false);
		});

		it('should return true when a child route matches', () => {
			expect(service.isItemOrDescendantActive(testItems[1], '/services/web')).toBe(true);
		});

		it('should return true when a deeply nested child route matches', () => {
			expect(service.isItemOrDescendantActive(testItems[1], '/services/design/ui')).toBe(true);
		});

		it('should return false for a dropdown with no matching descendant', () => {
			expect(service.isItemOrDescendantActive(testItems[1], '/about')).toBe(false);
		});

		it('should handle array routes', () => {
			const item: HubNavItem = { id: 'arr', label: 'Arr', type: 'link', route: ['/services', 'web'] };
			expect(service.isItemOrDescendantActive(item, '/services/web')).toBe(true);
		});
	});
});
