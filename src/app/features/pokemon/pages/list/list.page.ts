import { TitleCasePipe, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonCol, IonContent, IonGrid, IonHeader, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonRow, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PokemonService } from 'src/app/core/services/pokemon.service';

interface PokemonCard {
  id: number;
  name: string;
  sprite: string | null;
}

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [IonInfiniteScroll, IonInfiniteScrollContent, IonImg, IonRow, IonGrid, IonContent, IonCol, IonTitle, IonToolbar, IonHeader, TitleCasePipe, NgForOf],           // Ionic imports serão adicionados pelo CLI
})
export class ListPage implements OnInit {
  pokemons: PokemonCard[] = [];
  offset = 0;
  readonly limit = 20;
  loading = false;

  constructor(private poke: PokemonService) { }

  ngOnInit() {
    this.loadMore();
  }

  loadMore(ev?: any) {
    if (this.loading) return;
    this.loading = true;

    this.poke
      .list(this.offset, this.limit)
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
          }))
        )
      )
      .subscribe({
        next: (cards) => {
          this.pokemons.push(...cards);
          this.offset += this.limit;
          this.loading = false;
          ev?.target.complete(); // encerra infinite-scroll
        },
        error: () => {
          this.loading = false;
          ev?.target.complete();
        },
      });
  }
}
