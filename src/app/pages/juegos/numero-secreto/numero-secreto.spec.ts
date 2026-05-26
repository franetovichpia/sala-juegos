import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumeroSecreto } from './numero-secreto';

describe('NumeroSecreto', () => {
  let component: NumeroSecreto;
  let fixture: ComponentFixture<NumeroSecreto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumeroSecreto],
    }).compileComponents();

    fixture = TestBed.createComponent(NumeroSecreto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
