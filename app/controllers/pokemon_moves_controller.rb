class PokemonMovesController < ApplicationController

  def create
    PokemonMove.create(pokemove_params)
  end

  private
  def pokemove_params
    params.require(:pokemonmove).permit(:pokemon_id, :move_id, :level)
  end
end
