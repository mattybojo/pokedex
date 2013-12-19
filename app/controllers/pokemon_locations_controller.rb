class PokemonLocationsController < ApplicationController

  def create
    PokemonLocation.create(pokeloc_params)
  end

  private
    def pokeloc_params
      params.require(:pokemonlocation).permit(:pokemon_id, :location_id, :time_of_day, :notes)
    end
end
