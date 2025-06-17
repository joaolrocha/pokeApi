import { Component, OnInit } from '@angular/core';
import {
  IonContent, IonHeader, IonBackButton, IonButtons,
  IonTitle, IonToolbar, IonImg, IonIcon
} from '@ionic/angular/standalone';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, switchMap, map, forkJoin, of } from 'rxjs';

import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonTcgCardComponent } from
  '../../components/pokemon-tcg-card/pokemon-tcg-card.component';
import { arrowForwardOutline } from 'ionicons/icons';

/* ────────── modelos ────────── */
interface StatLine { label: string; value: number; }
interface CardData {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  color: string;
  abilities: string[];
  description: string;
  stats: StatLine[];
}
interface EvoNode {
  species: { name: string };
  evolves_to: EvoNode[];
}
/* ───────────────────────────── */

@Component({
  standalone: true,
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  imports: [
    CommonModule, TitleCasePipe,
    RouterModule,
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    IonContent,
    PokemonTcgCardComponent,
  ],
})
export class DetailsPage implements OnInit {

  card?: CardData;                                           // carta completa
  evo: { id:number; name:string; sprite:string|null; type:string }[] = [];

  arrow = arrowForwardOutline;                               // ícone seta

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private poke  : PokemonService
  ) {}

  /* -------- ciclo de vida -------- */
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        return combineLatest([
          this.poke.get(id),
          this.poke.getPokemonSpecies(id)
        ]);
      }),
      switchMap(([pokeData, species]) => {
        this.buildCard(pokeData, species);
        return this.loadEvolution(species.evolution_chain?.url);
      })
    ).subscribe(list => this.evo = list);
  }

  /* -------- helpers -------- */
  goTo(id: number) { this.router.navigate(['/details', id]); }

  private buildCard(p: any, s: any) {
    this.card = {
      id   : p.id,
      name : p.name,
      sprite: p.sprites.other['official-artwork'].front_default,
      types: p.types.map((t: any) => t.type.name),
      height: p.height,
      weight: p.weight,
      color : s.color?.name ?? '',
      abilities: p.abilities.map((a: any) => a.ability.name),
      description:
        s.flavor_text_entries
          .find((f: any) => f.language.name === 'en')?.flavor_text
          ?.replace(/\f/g, ' ') || '',
      stats: p.stats.map((st: any) => ({
        label : st.stat.name.toUpperCase(),
        value : st.base_stat
      }))
    };
  }

  /** carrega cadeia de evolução, devolve lista com id/nome/sprite/tipo */
  private loadEvolution(url?: string) {
    if (!url) return of([]);

    return this.poke.genericGet<{ chain: EvoNode }>(url).pipe(
      map(r => this.flattenChain(r.chain)),
      switchMap(names => forkJoin(names.map(n => this.poke.get(n)))),
      map(list => list.map(p => ({
        id: p.id,
        name: p.name,
        sprite: p.sprites.other['official-artwork'].front_default,
        type: p.types[0].type.name
      })))
    );
  }

  /** percorre árvore de evolução, devolve nomes em ordem */
  private flattenChain(node: EvoNode, acc: string[] = []): string[] {
    acc.push(node.species.name);
    node.evolves_to.forEach(child => this.flattenChain(child, acc));
    return acc;
  }
}
