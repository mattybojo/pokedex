class CreatePokemonLocations < ActiveRecord::Migration
  def change
    create_table :pokemon_locations do |t|
      t.integer "pokemon_id"
      t.integer "location_id"
      t.string  "time_of_day"
      t.string  "notes"
    end
  end
end
