import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButtons, IonContent, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonLabel,
  IonModal,
  IonSearchbar, IonSegment, IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { firstValueFrom, forkJoin, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonCardComponent } from 'src/app/shared/components/pokemon-card/pokemon-card.component';

/* ───── todos os tipos ───── */
const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;
type PokeType = (typeof ALL_TYPES)[number];
/* ────────────────────────── */

interface PokemonCardData {
  id: number;
  name: string;
  sprite: string | null;
  type: PokeType;
}

@Component({
  standalone: true,
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [IonTitle,
    CommonModule, FormsModule, NgForOf,
    IonHeader, IonToolbar, IonButtons, IonIcon,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
    IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
    IonModal,                                    // ← modal standalone
    PokemonCardComponent
  ],
})
export class ListPage implements OnInit {

  /* ---------- filtros / estado ---------- */
  readonly ALL_TYPES = ALL_TYPES;
  allNames: string[] = [];
  poolNames: string[] = [];
  pokemons: PokemonCardData[] = [];

  search = '';
  typeFilter: '' | PokeType = '';

  offset = 0;
  readonly limit = 40;
  loading = false;

  /* ---------- favoritos ---------- */
  showFavs = false;                 // controla <ion-modal>
  favMons: PokemonCardData[] = [];

  constructor(
    private poke: PokemonService,
    private fav: FavoritesService,
    private router: Router
  ) { }

  /* ---------- ciclo de vida ---------- */
  ngOnInit() {
    this.poke.listNames().subscribe(res => {
      this.allNames = res.results.map(r => r.name);
      this.applyFilters();
    });
  }

  /* ---------- abrir modal ---------- */
  async openFavs() {
    await this.loadFavMons();
    this.showFavs = true;
  }

  async loadFavMons() {
    const ids = await firstValueFrom(this.fav.list$.pipe(take(1)));
    if (!ids.length) { this.favMons = []; return; }

    const list = await firstValueFrom(
      forkJoin(ids.map(id => this.poke.get(id)))
    );

    this.favMons = list.map(p => ({
      id: p.id,
      name: p.name,
      sprite: p.sprites.other['official-artwork'].front_default ?? p.sprites.front_default,
      type: p.types[0].type.name as PokeType
    }));
  }

  /* ---------- favoritos helpers ---------- */
  isFav = (id: number) => this.fav.isFav(id);
  toggleFav = (id: number) => { this.fav.toggle(id); this.loadFavMons(); };

  /* ---------- filtros ---------- */
  applyFilters() {
    const base$ = this.typeFilter
      ? this.poke.getByType(this.typeFilter).pipe(
        map(r => r.pokemon.map(p => p.pokemon.name))
      )
      : of(this.allNames);

    base$.subscribe(baseNames => this.finishFilter(baseNames));
  }

  private finishFilter(base: string[]) {
    const txt = this.search.trim().toLowerCase();
    this.poolNames = base.filter(n => !txt || n.includes(txt));

    this.pokemons = [];
    this.offset = 0;
    this.loadMore();
  }

  /* ---------- paginação ---------- */
  loadMore(ev?: any) {
    if (this.loading || this.offset >= this.poolNames.length) {
      ev?.target.complete(); return;
    }
    this.loading = true;

    const slice = this.poolNames.slice(this.offset, this.offset + this.limit);

    forkJoin(slice.map(name => this.poke.get(name))).pipe(
      map(arr => arr.map(p => ({
        id: p.id,
        name: p.name.toLowerCase(),
        sprite: p.sprites.other['official-artwork'].front_default ?? p.sprites.front_default,
        type: p.types[0].type.name as PokeType
      })))
    ).subscribe(cards => {
      this.pokemons.push(...cards);
      this.offset += this.limit;
      this.loading = false;
      ev?.target.complete();
    });
  }

  openDetails = (id: number) => this.router.navigate(['/details', id]);
}
