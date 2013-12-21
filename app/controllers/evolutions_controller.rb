class EvolutionsController < ApplicationController

  def create
    Evolution.create(evolution_params)
  end

  private
  def evolution_params
    params.require(:evolution).permit(:base_poke_id, :evol_poke_id, :method)
  end
end