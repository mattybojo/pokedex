class CreatePokemon < ActiveRecord::Migration
  def change
    create_table :pokemon do |t|
      t.string "name"
      t.string "type1"
      t.string "type2"
      t.string "slug"
    end

    add_index "pokemon", ["slug"], :name => "index_pokemon_on_slug"
  end
end
