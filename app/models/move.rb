class Move < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :pokemons, :through => :pokemon_moves
  has_many :pokemon_moves

  def should_generate_new_friendly_id?
    new_record?
  end

  def to_s
    name
  end
end
