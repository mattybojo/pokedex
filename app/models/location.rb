# == Schema Information
#
# Table name: locations
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  slug        :string(255)
#  description :string(255)
#

class Location < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged

  has_many :pokemon, :through => :pokemon_locations
  has_many :pokemon_locations

  def should_generate_new_friendly_id?
    new_record?
  end

  def to_s
    name
  end
end
