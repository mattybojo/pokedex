class CreateMoves < ActiveRecord::Migration
  def change
    create_table :moves do |t|
      t.string  "name"
      t.string  "move_type"
      t.integer "pp"
      t.integer "power"
      t.string  "description"
      t.string  "slug"
      t.integer "accuracy"
    end

    add_index "moves", ["slug"], :name => "index_moves_on_slug"
  end
end
