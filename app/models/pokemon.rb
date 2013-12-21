# == Schema Information
#
# Table name: pokemon
#
#  id    :integer          not null, primary key
#  name  :string(255)
#  type1 :string(255)
#  type2 :string(255)
#  slug  :string(255)
#

class Pokemon < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  self.pluralize_table_names = false

  has_many :locations, :through => :pokemon_locations
  has_many :pokemon_locations
  has_many :moves, :through => :pokemon_moves
  has_many :pokemon_moves
  has_many :evolutions

  def should_generate_new_friendly_id?
    new_record?
  end

  def to_s
    name
  end
end
