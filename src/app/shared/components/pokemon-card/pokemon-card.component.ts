import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonIcon,
  IonImg,
  IonBadge,
} from '@ionic/angular/standalone';
import { TitleCasePipe, DecimalPipe, NgIf } from '@angular/common';


@Component({
  selector: 'pokemon-card',
  standalone: true,
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [
    TitleCasePipe,
    IonCard,
    IonImg,
    IonIcon,
    IonBadge,
    DecimalPipe,
    NgIf
  ],
})
export class PokemonCardComponent {
  // dados mínimos
  @Input({ required: true }) id!: number;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) sprite!: string | null;
  @Input({ required: true }) type!: string; // primeiro tipo do Pokémon

  // favoritos / click
  @Input() fav = false;
  @Input() showHeart = false;
  @Input() onSelect?: (id: number) => void;
}
