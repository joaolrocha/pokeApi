import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent, IonHeader,
  IonIcon,
  IonImg,
  IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { combineLatest, forkJoin, map, of, switchMap } from 'rxjs';

import { arrowForwardOutline } from 'ionicons/icons';
import { PokemonService } from 'src/app/core/services/pokemon.service';
import { PokemonTcgCardComponent } from '../../components/pokemon-tcg-card/pokemon-tcg-card.component';

/* ------------------------------------------------------------------ */
/* Tipos auxiliares                                                    */
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
}

interface EvoNode {
  species: { name: string };
  evolves_to: EvoNode[];
}
/* ------------------------------------------------------------------ */

@Component({
  standalone: true,
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  imports: [ IonIcon, IonImg,
    CommonModule, TitleCasePipe,
    RouterModule,
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonContent,
    PokemonTcgCardComponent,
  ],
})
export class DetailsPage implements OnInit {

  card?: CardData;
  gallery: string[] = [];
  evo: { id: number; name: string; sprite: string | null }[] = [];

  arrow = arrowForwardOutline;          // ícone seta para o template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poke: PokemonService
  ) { }

  /* -------------------------- ciclo de vida -------------------------- */
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        return combineLatest([
          this.poke.get(id),
          this.poke.getPokemonSpecies(id)
        ]);
      }),
      switchMap(([p, s]) => {
        /* monta card */
        this.buildCard(p, s);

        /* coleta sprites para galeria */
        this.gallery = [
          p.sprites.front_default,
          p.sprites.back_default,
          p.sprites.front_shiny,
          p.sprites.back_shiny,
          p.sprites.other.dream_world.front_default
        ].filter(Boolean) as string[];

        /* ------------- evolução ------------- */
        const evoUrl: string | undefined = s.evolution_chain?.url;
        if (!evoUrl) return of([]);

        return this.poke.genericGet<any>(evoUrl).pipe(
          map(resp => this.flattenChain(resp.chain)),      // ← aqui
          switchMap(names => forkJoin(names.map(n => this.poke.get(n))))
        );
      })
    ).subscribe(list => {
      /* lista pode vir vazia se não houver evolução */
      this.evo = (list as any[]).map(p => ({
        id: p.id,
        name: p.name,
        sprite: p.sprites.other['official-artwork'].front_default,
        type: p.types[0].type.name
      }));
    });
  }

  /* ------------------------ helpers ------------------------ */
  goTo(id: number) {
    this.router.navigate(['/details', id]);
  }

  private buildCard(p: any, s: any) {
    this.card = {
      id: p.id,
      name: p.name,
      sprite: p.sprites.other['official-artwork'].front_default,
      types: p.types.map((t: any) => t.type.name),
      height: p.height,
      weight: p.weight,
      color: s.color?.name || '',
      abilities: p.abilities.map((a: any) => a.ability.name),
      description: s.flavor_text_entries
        .find((f: any) => f.language.name === 'en')?.flavor_text
        ?.replace(/\f/g, ' ') || ''
    };
  }

  /** percorre a árvore de evolução e devolve nomes em ordem */
  private flattenChain(node: EvoNode, acc: string[] = []): string[] {
    acc.push(node.species.name);
    node.evolves_to.forEach(n => this.flattenChain(n, acc));
    return acc;
  }
}
