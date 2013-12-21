class LocationsController < ApplicationController
  include ApplicationHelper

  def create
    Location.create(location_params)
  end

  def index
    @locations = Location.all
  end

  def edit
    @location = Location.friendly.find(params[:id])
  end

  def show
    @location = Location.friendly.find(params[:id])
    @pokemon_location = PokemonLocation.where(location_id: get_location_id(params[:id]))
  end

  private
    def location_params
      params.require(:location).permit(:name, :slug, :description)
    end
end
