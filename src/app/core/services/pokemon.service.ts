import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListResponse, Pokemon, PokemonSpecies } from '../models/pokemon';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private api = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  list(offset = 0, limit = 20) {
    return this.http.get<ListResponse>(`${this.api}/pokemon`, {
      params: { offset, limit },
    });
  }

  get(idOrName: number | string) {
    return this.http.get<Pokemon>(`${this.api}/pokemon/${idOrName}`);
  }

  species(idOrName: number | string) {
    return this.http.get<PokemonSpecies>(
      `${this.api}/pokemon-species/${idOrName}`
    );
  }

  /** helper para uso rápido em scripts */
  async peek(id = 1) {
    return firstValueFrom(this.get(id));
  }

  listNames(limit = 2000) {
  return this.http.get<ListResponse>(`${this.api}/pokemon`, {
    params: { offset: 0, limit }
  });
}

getByType(type: string) {
  return this.http.get<{ pokemon: { pokemon: { name: string } }[] }>(
    `${this.api}/type/${type}`
  );
}
}
