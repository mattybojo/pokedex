class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.string "name"
      t.string "slug"
      t.string "description"
    end
  end
end
