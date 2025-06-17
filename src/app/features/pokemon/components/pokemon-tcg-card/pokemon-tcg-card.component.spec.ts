import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PokemonTcgCardComponent } from './pokemon-tcg-card.component';

describe('PokemonTcgCardComponent', () => {
  let component: PokemonTcgCardComponent;
  let fixture: ComponentFixture<PokemonTcgCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PokemonTcgCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonTcgCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
