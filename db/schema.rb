# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20131219220546) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "evolutions", force: true do |t|
    t.integer "base_poke_id"
    t.integer "evol_poke_id"
    t.string  "method"
  end

  create_table "locations", force: true do |t|
    t.string "name"
    t.string "slug"
    t.string "description"
  end

  create_table "moves", force: true do |t|
    t.string  "name"
    t.string  "move_type"
    t.integer "pp"
    t.integer "power"
    t.string  "description"
    t.string  "slug"
    t.integer "accuracy"
  end

  add_index "moves", ["slug"], name: "index_moves_on_slug", using: :btree

  create_table "pokemon", force: true do |t|
    t.string "name"
    t.string "type1"
    t.string "type2"
    t.string "slug"
  end

  add_index "pokemon", ["slug"], name: "index_pokemon_on_slug", using: :btree

  create_table "pokemon_locations", force: true do |t|
    t.integer "pokemon_id"
    t.integer "location_id"
    t.string  "time_of_day"
    t.string  "notes"
  end

  create_table "pokemon_moves", force: true do |t|
    t.integer "level"
    t.integer "pokemon_id"
    t.integer "move_id"
  end

  create_table "roles", force: true do |t|
    t.string   "name"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
  add_index "roles", ["name"], name: "index_roles_on_name", using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

end
