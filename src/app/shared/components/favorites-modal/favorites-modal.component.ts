import { Component } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, ModalController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';

@Component({
  standalone: true,
  selector: 'app-favorites-modal',
  templateUrl: './favorites-modal.component.html',
  styleUrls: ['./favorites-modal.component.scss'],
  imports: [
    CommonModule, NgForOf,
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
    PokemonCardComponent
  ],
})
export class FavoritesModalComponent {

  favMons: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private fav  : FavoritesService,
    private poke : PokemonService
  ) {
    this.load();
  }

  /** carrega detalhes de todos os favoritos */
  private async load() {
    const ids = await firstValueFrom(this.fav.list$);              // ✔
    const list = await Promise.all(
      ids.map(id => firstValueFrom(this.poke.get(id)))             // ✔
    );
    this.favMons = list;
  }

  close() { this.modalCtrl.dismiss(); }

  toggleFav = (id: number) => this.fav.toggle(id);
}
