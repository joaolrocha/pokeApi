import { Component, Input } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { IonBadge, IonImg } from '@ionic/angular/standalone';

interface StatLine { label: string; value: number; }
interface CardData {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;   // dm
  weight: number;   // hg
  color: string;
  abilities: string[];
  description: string;
  stats: StatLine[];
}

@Component({
  selector: 'pokemon-tcg-card',
  standalone: true,
  templateUrl: './pokemon-tcg-card.component.html',
  styleUrls: ['./pokemon-tcg-card.component.scss'],
  imports: [CommonModule, TitleCasePipe, IonBadge, IonImg],
})
export class PokemonTcgCardComponent {
  @Input({ required: true }) data!: CardData;
  @Input() disableFlip = false;   // se quiser desativar em algum lugar
  flipped = false;

  toggle() {
    if (!this.disableFlip) { this.flipped = !this.flipped; }
  }
}
