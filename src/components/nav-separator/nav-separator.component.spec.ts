import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HubNavSeparatorComponent } from './nav-separator.component';

describe('HubNavSeparatorComponent', () => {
	let fixture: ComponentFixture<HubNavSeparatorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavSeparatorComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HubNavSeparatorComponent);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should have role="separator"', () => {
		expect(fixture.nativeElement.getAttribute('role')).toBe('separator');
	});

	it('should have the hub-nav-separator class', () => {
		expect(fixture.nativeElement.classList.contains('hub-nav-separator')).toBe(true);
	});
});
