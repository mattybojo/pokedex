#!/bin/env ruby

require '../../config/environment.rb'
require 'nokogiri'
require 'open-uri'

poke_moves = "moves.csv"
pokemon = Pokemon.pluck(:slug)

File.open poke_moves, 'w' do |f|

  f.puts "name,type,power,accuracy,pp,description"

  [1,2].each do |version|
    # Get a Nokogiri::HTML::Document for the page we’re interested in...
    doc = Nokogiri::HTML(open("http://pokemondb.net/move/generation/#{version}"))

    # Search for nodes by xpath
    doc.xpath("//table[@class='data-table wide-table' and @id='moves']/tbody/tr/td").each_with_index do |data,i|
      x = i % 7
      case x
      when 0
        f.write "#{data.content},"
      when 1
        f.write "#{data.content},"
      when 3
        if data.content.eql? "-"
          f.write "0,"
        else
          f.write "#{data.content},"
        end
      when 4
        if data.content.eql? "-"
          f.write "0,"
        else
          f.write "#{data.content},"
        end
      when 5
        if data.content.eql? "-"
          f.write "0,"
        else
          f.write "#{data.content},"
        end
      when 6
          f.puts "#{data.content}"
      end
    end
  end
end