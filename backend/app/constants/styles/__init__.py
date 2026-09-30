# Import all styles alphabetically
from app.schemas.styles import StyleItem

from .abstract import abstract_styles
from .academia import academia_styles
from .action import action_styles
from .adorable import adorable_styles
from .ads import ads_styles
from .art import art_styles
from .artstyle import artstyle_styles
from .astral import astral_styles
from .avant import avant_styles
from .baroque import baroque_styles
from .bauhaus import bauhaus_styles
from .blueprint import blueprint_styles
from .caricature import caricature_styles
from .cel import cel_styles
from .character import character_styles
from .cinematic import cinematic_styles
from .classicism import classicism_styles
from .color import color_styles
from .colored import colored_styles
from .conceptual import conceptual_styles
from .constructivism import constructivism_styles
from .cubism import cubism_styles
from .dadaism import dadaism_styles
from .dark import dark_styles
from .dmt import dmt_styles
from .doodle import doodle_styles
from .double import double_styles
from .dripping import dripping_styles
from .expressionism import expressionism_styles
from .faded import faded_styles
from .fauvism import fauvism_styles
from .flat import flat_styles
from .fooocus import fooocus_styles
from .fortnite import fortnite_styles
from .futurism import futurism_styles
from .futuristic import futuristic_styles
from .game import game_styles
from .glitchcore import glitchcore_styles
from .glo import glo_styles
from .googie import googie_styles
from .graffiti import graffiti_styles
from .harlem import harlem_styles
from .high import high_styles
from .idyllic import idyllic_styles
from .impressionism import impressionism_styles
from .infographic import infographic_styles
from .ink import ink_styles
from .japanese import japanese_styles
from .knolling import knolling_styles
from .light import light_styles
from .logo import logo_styles
from .luxurious import luxurious_styles
from .macro import macro_styles
from .mandola import mandola_styles
from .marker import marker_styles
from .medievalism import medievalism_styles
from .minimalism import minimalism_styles
from .misc import misc_styles
from .mk import mk_styles
from .mre import mre_styles
from .neo import neo_styles
from .neoclassicism import neoclassicism_styles
from .op import op_styles
from .ornate import ornate_styles
from .papercraft import papercraft_styles
from .pebble import pebble_styles
from .pencil import pencil_styles
from .photo import photo_styles
from .pop import pop_styles
from .rococo import rococo_styles
from .sai import sai_styles
from .silhouette import silhouette_styles
from .simple import simple_styles
from .sketchup import sketchup_styles
from .steampunk import steampunk_styles
from .sticker import sticker_styles
from .suprematism import suprematism_styles
from .surrealism import surrealism_styles
from .terragen import terragen_styles
from .tranquil import tranquil_styles
from .vibrant import vibrant_styles
from .volumetric import volumetric_styles
from .watercolor import watercolor_styles
from .whimsical import whimsical_styles

# Mapping of section id to display name
sections: dict[str, str] = {
	'abstract': 'Abstract',
	'academia': 'Academia',
	'action': 'Action',
	'adorable': 'Adorable',
	'ads': 'Ads',
	'art': 'Art',
	'artstyle': 'Artstyle',
	'astral': 'Astral',
	'avant': 'Avant',
	'baroque': 'Baroque',
	'bauhaus': 'Bauhaus',
	'blueprint': 'Blueprint',
	'caricature': 'Caricature',
	'cel': 'Cel',
	'character': 'Character',
	'cinematic': 'Cinematic',
	'classicism': 'Classicism',
	'color': 'Color',
	'colored': 'Colored',
	'conceptual': 'Conceptual',
	'constructivism': 'Constructivism',
	'cubism': 'Cubism',
	'dadaism': 'Dadaism',
	'dark': 'Dark',
	'dmt': 'DMT',
	'doodle': 'Doodle',
	'double': 'Double',
	'dripping': 'Dripping',
	'expressionism': 'Expressionism',
	'faded': 'Faded',
	'fauvism': 'Fauvism',
	'flat': 'Flat',
	'fooocus': 'Fooocus',
	'fortnite': 'Fortnite',
	'futurism': 'Futurism',
	'futuristic': 'Futuristic',
	'game': 'Game',
	'glitchcore': 'Glitchcore',
	'glo': 'Glo',
	'googie': 'Googie',
	'graffiti': 'Graffiti',
	'harlem': 'Harlem',
	'high': 'High',
	'idyllic': 'Idyllic',
	'impressionism': 'Impressionism',
	'infographic': 'Infographic',
	'ink': 'Ink',
	'japanese': 'Japanese',
	'knolling': 'Knolling',
	'light': 'Light',
	'logo': 'Logo',
	'luxurious': 'Luxurious',
	'macro': 'Macro',
	'mandola': 'Mandola',
	'marker': 'Marker',
	'medievalism': 'Medievalism',
	'minimalism': 'Minimalism',
	'misc': 'Misc',
	'mk': 'MK',
	'mre': 'MRE',
	'neo': 'Neo',
	'neoclassicism': 'Neoclassicism',
	'op': 'Op',
	'ornate': 'Ornate',
	'papercraft': 'Papercraft',
	'pebble': 'Pebble',
	'pencil': 'Pencil',
	'photo': 'Photo',
	'pop': 'Pop',
	'rococo': 'Rococo',
	'sai': 'SAI',
	'silhouette': 'Silhouette',
	'simple': 'Simple',
	'sketchup': 'SketchUp',
	'steampunk': 'Steampunk',
	'sticker': 'Sticker',
	'suprematism': 'Suprematism',
	'surrealism': 'Surrealism',
	'terragen': 'Terragen',
	'tranquil': 'Tranquil',
	'vibrant': 'Vibrant',
	'volumetric': 'Volumetric',
	'watercolor': 'Watercolor',
	'whimsical': 'Whimsical',
}

# Aggregate all styles into a mapping: section_id -> list[StyleItem]
all_styles: dict[str, list[StyleItem]] = {}
for section_id in sections.keys():
	styles_list = locals().get(f'{section_id}_styles')
	if styles_list:
		all_styles[section_id] = styles_list

__all__ = [
	'abstract_styles',
	'academia_styles',
	'action_styles',
	'adorable_styles',
	'ads_styles',
	'all_styles',
	'art_styles',
	'artstyle_styles',
	'astral_styles',
	'avant_styles',
	'baroque_styles',
	'bauhaus_styles',
	'blueprint_styles',
	'caricature_styles',
	'cel_styles',
	'character_styles',
	'cinematic_styles',
	'classicism_styles',
	'color_styles',
	'colored_styles',
	'conceptual_styles',
	'constructivism_styles',
	'cubism_styles',
	'dadaism_styles',
	'dark_styles',
	'dmt_styles',
	'doodle_styles',
	'double_styles',
	'dripping_styles',
	'expressionism_styles',
	'faded_styles',
	'fauvism_styles',
	'flat_styles',
	'fooocus_styles',
	'fortnite_styles',
	'futurism_styles',
	'futuristic_styles',
	'game_styles',
	'glitchcore_styles',
	'glo_styles',
	'googie_styles',
	'graffiti_styles',
	'harlem_styles',
	'high_styles',
	'idyllic_styles',
	'impressionism_styles',
	'infographic_styles',
	'ink_styles',
	'japanese_styles',
	'knolling_styles',
	'light_styles',
	'logo_styles',
	'luxurious_styles',
	'macro_styles',
	'mandola_styles',
	'marker_styles',
	'medievalism_styles',
	'minimalism_styles',
	'misc_styles',
	'mk_styles',
	'mre_styles',
	'neo_styles',
	'neoclassicism_styles',
	'op_styles',
	'ornate_styles',
	'papercraft_styles',
	'pebble_styles',
	'pencil_styles',
	'photo_styles',
	'pop_styles',
	'rococo_styles',
	'sai_styles',
	'sections',
	'silhouette_styles',
	'simple_styles',
	'sketchup_styles',
	'steampunk_styles',
	'sticker_styles',
	'suprematism_styles',
	'surrealism_styles',
	'terragen_styles',
	'tranquil_styles',
	'vibrant_styles',
	'volumetric_styles',
	'watercolor_styles',
	'whimsical_styles',
]
