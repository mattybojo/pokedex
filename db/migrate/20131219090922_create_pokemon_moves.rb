class CreatePokemonMoves < ActiveRecord::Migration
  def change
    create_table :pokemon_moves do |t|
      t.integer "level"
      t.integer "pokemon_id"
      t.integer "move_id"
    end
  end
end
