import { Component, OnInit } from '@angular/core';
import {
  IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent,
  IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { NgForOf } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PokemonService } from 'src/app/core/services/pokemon.service';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonCardComponent } from 'src/app/shared/components/pokemon-card/pokemon-card.component';

interface PokemonCardData {
  id: number;
  name: string;
  sprite: string | null;
  type: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
    PokemonCardComponent, NgForOf,
  ],
})
export class ListPage implements OnInit {
  pokemons: PokemonCardData[] = [];

  offset = 0;
  readonly limit = 20;
  private firstLoad = true;
  loading = false;

  /* ---- favoritos ---- */
  constructor(
    private poke: PokemonService,
    private fav: FavoritesService
  ) {}

  /** Getter usado no template (ainda sem filtros) */
  get filtered() { return this.pokemons; }

  /** Helpers de favorito */
  isFav = (id: number) => this.fav.isFav(id);
  toggleFav = (id: number) => this.fav.toggle(id);

  ngOnInit() { this.loadMore(); }

  openDetails = (id: number) => console.log('detalhes', id);

  loadMore(ev?: any) {
    if (this.loading) return;
    this.loading = true;

    const batch = this.firstLoad ? 60 : this.limit;

    this.poke.list(this.offset, batch).pipe(
      switchMap(res => forkJoin(res.results.map(r => this.poke.get(r.name)))),
      map(arr => arr.map(p => ({
        id: p.id,
        name: p.name,
        sprite: p.sprites.other['official-artwork'].front_default ?? p.sprites.front_default,
        type: p.types[0].type.name,
      })))
    ).subscribe({
      next: cards => {
        this.pokemons.push(...cards);
        this.offset += batch;
        this.firstLoad = false;
        this.loading = false;
        ev?.target.complete();
      },
      error: () => { this.loading = false; ev?.target.complete(); }
    });
  }
}
