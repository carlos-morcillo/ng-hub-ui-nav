import { TestBed } from '@angular/core/testing';
import { HubNavConfigService } from './nav-config.service';

describe('HubNavConfigService', () => {
	let service: HubNavConfigService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(HubNavConfigService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getDefaults()', () => {
		it('should return default config values', () => {
			const defaults = service.getDefaults();
			expect(defaults.orientation).toBe('horizontal');
			expect(defaults.verticalExpandMode).toBe('accordion');
			expect(defaults.dropdownTrigger).toBe('click');
			expect(defaults.position).toBe('static');
			expect(defaults.stickyTop).toBe('0px');
			expect(defaults.collapseMode).toBe('offcanvas');
			expect(defaults.collapseBreakpoint).toBe(992);
			expect(defaults.offcanvasPosition).toBe('start');
			expect(defaults.ariaLabel).toBe('Navigation');
		});

		it('should return a copy (not the same reference)', () => {
			const a = service.getDefaults();
			const b = service.getDefaults();
			expect(a).not.toBe(b);
			expect(a).toEqual(b);
		});
	});

	describe('getConfig()', () => {
		it('should return a readonly signal with default values', () => {
			const config = service.getConfig();
			expect(config().orientation).toBe('horizontal');
		});
	});

	describe('updateConfig()', () => {
		it('should merge partial config into current config', () => {
			service.updateConfig({ orientation: 'vertical', dropdownTrigger: 'hover' });
			const config = service.getConfig();
			expect(config().orientation).toBe('vertical');
			expect(config().dropdownTrigger).toBe('hover');
			// Other properties should remain default
			expect(config().position).toBe('static');
			expect(config().stickyTop).toBe('0px');
		});
	});

	describe('resetToDefaults()', () => {
		it('should restore default config after updates', () => {
			service.updateConfig({ orientation: 'vertical', collapseBreakpoint: 768 });
			service.resetToDefaults();
			const config = service.getConfig();
			expect(config().orientation).toBe('horizontal');
			expect(config().collapseBreakpoint).toBe(992);
		});
	});

	describe('resolve()', () => {
		it('should merge overrides with current config', () => {
			const resolved = service.resolve({ orientation: 'vertical' });
			expect(resolved.orientation).toBe('vertical');
			expect(resolved.dropdownTrigger).toBe('click');
			expect(resolved.stickyTop).toBe('0px');
		});

		it('should give overrides priority over global config', () => {
			service.updateConfig({ orientation: 'vertical' });
			const resolved = service.resolve({ orientation: 'horizontal' });
			expect(resolved.orientation).toBe('horizontal');
		});

		it('should preserve global config when override is empty', () => {
			service.updateConfig({ dropdownTrigger: 'hover' });
			const resolved = service.resolve({});
			expect(resolved.dropdownTrigger).toBe('hover');
		});
	});
});
