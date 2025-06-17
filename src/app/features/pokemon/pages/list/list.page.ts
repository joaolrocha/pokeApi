import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';     
import {
  IonContent, IonHeader,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonLabel,
  IonSearchbar,
  IonSegment, IonSegmentButton,
  IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { FavoritesService } from 'src/app/core/services/favorites.service';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonCardComponent } from 'src/app/shared/components/pokemon-card/pokemon-card.component';

/* ───── todos os tipos de Pokémon ───── */
const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;
type PokeType = (typeof ALL_TYPES)[number];
/* ───────────────────────────────────── */

interface PokemonCardData {
  id: number;
  name: string;          // em minúsculas
  sprite: string | null;
  type: PokeType;
}

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [
    CommonModule, FormsModule, NgForOf,
    IonHeader, IonToolbar, IonTitle,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
    IonContent, IonInfiniteScroll, IonInfiniteScrollContent,
    PokemonCardComponent,
  ],
})
export class ListPage implements OnInit {

  /* ---------- dados e estado ---------- */
  readonly ALL_TYPES = ALL_TYPES;          // expõe para o template
  allNames: string[] = [];                 // todos os nomes (ou filtrados por tipo)
  poolNames: string[] = [];                // nomes após busca por texto
  pokemons: PokemonCardData[] = [];        // objetos detalhados exibidos

  offset = 0;
  readonly limit = 40;
  loading = false;

  /* filtros */
  search = '';
  typeFilter: '' | PokeType = '';

  constructor(
    private poke: PokemonService,
    private fav: FavoritesService,
    private router: Router  
  ) { }

  /* ---------- favoritos ---------- */
  isFav = (id: number) => this.fav.isFav(id);
  toggleFav = (id: number) => this.fav.toggle(id);

  openDetails = (id: number) => this.router.navigate(['/details', id]);

  /* ---------- ciclo de vida ---------- */
  ngOnInit() {
    /* baixa TODOS os nomes uma única vez */
    this.poke.listNames().subscribe(res => {
      this.allNames = res.results.map(r => r.name);
      this.applyFilters();                 // carregamento inicial
    });
  }

  /* ---------- filtros ---------- */
  applyFilters() {
    /* 1. Filtra por tipo (se algum selecionado) */
    const base$ = this.typeFilter
      ? this.poke.getByType(this.typeFilter).pipe(
        map(r => r.pokemon.map(p => p.pokemon.name))
      )
      : of(this.allNames);

    base$.subscribe(baseNames => this.finishFilter(baseNames));
  }

  private finishFilter(base: string[]) {
    /* 2. Filtra texto */
    const txt = this.search.trim().toLowerCase();
    this.poolNames = base.filter(n => !txt || n.includes(txt));

    /* 3. Reinicia paginação */
    this.pokemons = [];
    this.offset = 0;
    this.loadMore();
  }

  /* ---------- paginação / detalhes ---------- */
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
        type: p.types[0].type.name as PokeType,
      })))
    ).subscribe(cards => {
      this.pokemons.push(...cards);
      this.offset += this.limit;
      this.loading = false;
      ev?.target.complete();
    });
  }
}
