#!/bin/env ruby

require '../../config/environment.rb'
require 'nokogiri'
require 'open-uri'

poke_moves = "pokemon_moves.csv"
pokemon = Pokemon.pluck(:slug)

File.open poke_moves, 'w' do |f|

  f.puts "pokemon,level,move"
  pokemon.each do |poke|
    # Get a Nokogiri::HTML::Document for the page we’re interested in...
    doc = Nokogiri::HTML(open("http://pokemondb.net/pokedex/#{poke}/moves/2"))

    # Search for nodes by xpath
    doc.xpath("//table[@class='data-table'][1]/tbody/tr/td").each_with_index do |data,i|
      x = i % 6
      if x==0
        f.write "#{poke},#{data.content},"
      end
      if x==1
        f.puts data.content.to_s
      end
    end
  end
end