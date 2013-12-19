class PokemonController < ApplicationController
  include ApplicationHelper

  def create
    Pokemon.create(pokemon_params)
  end

  def index
    @pokemons = Pokemon.order('id ASC').all
  end

  def edit
    @pokemon = Pokemon.friendly.find(params[:id])
  end

  def show
    @pokemon = Pokemon.friendly.find(params[:id])
    @poke_locations = PokemonLocation.order('id ASC').find_all_by_pokemon_id(get_pokemon_id(params[:id]))
    @poke_moves = PokemonMove.order('id ASC').find_all_by_pokemon_id(get_pokemon_id(params[:id]))
  end

  private
    def pokemon_params
      params.require(:pokemon).permit(:name, :type1, :type2, :slug)
    end
end
