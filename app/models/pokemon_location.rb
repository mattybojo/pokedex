# == Schema Information
#
# Table name: pokemon_locations
#
#  id          :integer          not null, primary key
#  pokemon_id  :integer
#  location_id :integer
#  time_of_day :string(255)
#  notes       :string(255)
#

class PokemonLocation < ActiveRecord::Base

  belongs_to :location
  belongs_to :pokemon
end
