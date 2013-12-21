class Evolution < ActiveRecord::Base

  belongs_to :base_poke, :class_name => 'Pokemon', :foreign_key => 'base_poke_id'
  belongs_to :evol_poke, :class_name => 'Pokemon', :foreign_key => 'evol_poke_id'
end
