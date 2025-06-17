import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NgForOf } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PokemonService } from 'src/app/core/services/pokemon.service';
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    PokemonCardComponent,
    NgForOf,
  ],
})
export class ListPage implements OnInit {
  pokemons: PokemonCardData[] = [];

  offset = 0;           // posição atual na PokeAPI
  readonly limit = 20;  // lote “normal”
  private firstLoad = true;
  loading = false;

  constructor(private poke: PokemonService) {}

  ngOnInit() {
    this.loadMore();
  }

  /** abre detalhes (vai virar router.navigate depois) */
  openDetails = (id: number) => console.log('clicou', id);

  /** chamada usada pelo infinite-scroll e pelo primeiro load */
  loadMore(ev?: any) {
    if (this.loading) return;
    this.loading = true;

    // 60 no primeiro fetch, depois 20
    const batch = this.firstLoad ? 60 : this.limit;

    this.poke
      .list(this.offset, batch)
      .pipe(
        switchMap((res) =>
          forkJoin(res.results.map((r) => this.poke.get(r.name)))
        ),
        map((arr) =>
          arr.map((p) => ({
            id: p.id,
            name: p.name,
            sprite:
              p.sprites.other['official-artwork'].front_default ??
              p.sprites.front_default,
            type: p.types[0].type.name,
          }))
        )
      )
      .subscribe({
        next: (cards) => {
          this.pokemons.push(...cards);
          this.offset += batch;
          this.firstLoad = false;      // a partir daqui usa 20 em 20
          this.loading = false;
          ev?.target.complete();
        },
        error: () => {
          this.loading = false;
          ev?.target.complete();
        },
      });
  }
}
