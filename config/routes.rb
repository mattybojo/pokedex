Pokedex::Application.routes.draw do
  root :to => "home#index"
  devise_for :users, :controllers => {:registrations => "registrations"}
  resources :users
  resources :pokemon, :only => [:index, :show, :edit]
  resources :locations, :only => [:index, :show, :edit]
  resources :moves, :only => [:index, :show, :edit]
end