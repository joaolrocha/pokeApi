import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const KEY = 'fav-pokemons';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private subject = new BehaviorSubject<number[]>(this.load());

  /** observable para bind assíncrono */
  list$ = this.subject.asObservable();

  toggle(id: number): void {
    const list = new Set(this.subject.value);
    list.has(id) ? list.delete(id) : list.add(id);
    this.save([...list]);
  }

  isFav(id: number): boolean {
    return this.subject.value.includes(id);
  }

  /* helpers ----------------- */
  private load(): number[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  private save(arr: number[]): void {
    localStorage.setItem(KEY, JSON.stringify(arr));
    this.subject.next(arr);
  }

   constructor() {
    // DEBUG: mostra no console toda vez que muda
    this.list$.subscribe(list => console.log('[FAVORITOS] →', list));
  }
}
