class CreateEvolutions < ActiveRecord::Migration
  def change
    create_table :evolutions do |t|
      t.integer "base_poke_id"
      t.integer "evol_poke_id"
      t.string "method"
    end
  end
end
