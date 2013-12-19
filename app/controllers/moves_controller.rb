class MovesController < ApplicationController
  include ApplicationHelper

  def create
    Move.create(move_params)
  end

  def index
    @moves = Move.all
  end

  def edit
    @move = Move.friendly.find(get_move_id(params[:id]))
  end

  def show
    @move = Move.friendly.find(get_move_id(params[:id]))
  end

  private
    def move_params
      params.require(:move).permit(:name, :move_type, :pp, :power, :description, :slug, :accuracy)
    end
end
