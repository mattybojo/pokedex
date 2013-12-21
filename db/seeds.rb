require 'csv'

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
# Environment variables (ENV['...']) can be set in the file config/application.yml.
# See http://railsapps.github.io/rails-environment-variables.html
def import_from_pokemon_csv
  file=File.new("db/data/pokemon.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :name => row[0],
          :type1 => row[1],
          :type2 => row[2]
      }

      pokemon = Pokemon.create!(properties)
    end
  end
  Pokemon.find_each(&:save) # Update each with slug info

  # Change slug for Nidorans
  poke = Pokemon.find(95)
  poke.slug = "nidoran-f"
  poke.save

  poke = Pokemon.find(98)
  poke.slug = "nidoran-m"
  poke.save

  # Change slug for Farfetch'd
  poke = Pokemon.find(158)
  poke.slug = "farfetchd"
  poke.save
end

def import_from_locations_csv
  file=File.new("db/data/locations.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :name => row[0],
          :description => row[1]
      }

      location = Location.create!(properties)
    end
  end
  Location.find_each(&:save) # Update each with slug info

  # Change slug for Diglett's Cave
  loc = Location.find_by_slug('diglett-s-cave')
  loc.slug = "digletts-cave"
  loc.save
end

def import_from_pokemon_locations_csv
  file=File.new("db/data/pokemon_location.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :location_id => Location.find_by_slug(row[0]).id,
          :pokemon_id => Pokemon.find_by_slug(row[1]).id,
          :time_of_day => row[2],
          :notes => row[3]
      }

      pl = PokemonLocation.create!(properties)
    end
  end
end

def import_from_moves_csv
  file=File.new("db/data/moves.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :name => row[0],
          :move_type => row[1],
          :power => row[2],
          :accuracy => row[3],
          :pp => row[4],
          :description => row[5]
      }

      move = Move.create!(properties)
    end
  end

  Move.find_each(&:save) # Update each with slug info
end

def import_from_pokemon_moves_csv
  file=File.new("db/data/pokemon_moves.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :pokemon_id => Pokemon.find_by_slug(row[0]).id,
          :level => row[1],
          :move_id => Move.find_by_name(row[2]).id
      }

      pm = PokemonMove.create!(properties)
    end
  end
end

def import_from_evolutions_csv
  file=File.new("db/data/evolutions.csv")
  table = CSV.parse(file, :skip_blanks=>true, :headers=>:first_row)
  begin
    table.each do |row|

      properties = {
          :base_poke_id => Pokemon.find_by_slug(row[0]).id,
          :evol_poke_id => Pokemon.find_by_slug(row[1]).id,
          :method => row[2]
      }

      evol = Evolution.create!(properties)
    end
  end
end

puts 'ROLES'
YAML.load(ENV['ROLES']).each do |role|
  Role.find_or_create_by_name(role)
  puts 'role: ' << role
end
puts 'DEFAULT USERS'
user = User.find_or_create_by_email :name => ENV['ADMIN_NAME'].dup, :email => ENV['ADMIN_EMAIL'].dup, :password => ENV['ADMIN_PASSWORD'].dup, :password_confirmation => ENV['ADMIN_PASSWORD'].dup
puts 'user: ' << user.name
user.add_role :admin

import_from_pokemon_csv()
puts 'Finished importing Pokemon'
import_from_locations_csv()
puts 'Finished importing Locations'
import_from_pokemon_locations_csv()
puts 'Finished importing PokemonLocations'
import_from_moves_csv()
puts 'Finished importing Moves'
import_from_pokemon_moves_csv
puts 'Finished importing PokemonMoves'
import_from_evolutions_csv
puts 'Finished importing Evolutions'
