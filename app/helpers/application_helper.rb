module ApplicationHelper

  def display_base_errors resource
    return '' if (resource.errors.empty?) or (resource.errors[:base].empty?)
    messages = resource.errors[:base].map { |msg| content_tag(:p, msg) }.join
    html = <<-HTML
    <div class="alert alert-error alert-block">
      <button type="button" class="close" data-dismiss="alert">&#215;</button>
      #{messages}
    </div>
    HTML
    html.html_safe
  end

  def get_location_id(loc)
    Location.find_by_slug(loc).id
  end

  def get_pokemon_id(poke)
    Pokemon.find_by_slug(poke).id
  end

  def get_move_id(mov)
    Move.find_by_slug(mov).id
  end
end
