import os
from utils.place_info_search import GooglePlaceSearchTool, TavilyPlaceSearchTool
from typing import List
from langchain.tools import tool
from dotenv import load_dotenv

class PlaceSearchTool:
    def __init__(self):
        load_dotenv()
        self.google_api_key = os.environ.get("GPLACES_API_KEY")
        try:
            self.google_places_search = GooglePlaceSearchTool(self.google_api_key)
        except Exception as e:
            # Google validates the key on startup; don't let a missing/invalid key crash the app
            print(f"Google Places unavailable, using Tavily only: {e}")
            self.google_places_search = None
        self.tavily_search = TavilyPlaceSearchTool()
        self.place_search_tool_list = self._setup_tools()

    def _search(self, google_method: str, tavily_search, place: str, label: str) -> str:
        """Search with Google Places, falling back to Tavily if Google fails or finds nothing"""
        try:
            if self.google_places_search is None:
                raise RuntimeError("Google Places API key is missing or invalid")
            google_result = getattr(self.google_places_search, google_method)(place)
            if google_result:
                return f"Following are the {label} {place} as suggested by google: {google_result}"
            reason = "Google returned no results"
        except Exception as e:
            reason = f"Google cannot find the details due to {e}"
        tavily_result = tavily_search(place)
        return f"{reason}. \nFollowing are the {label} {place}: {tavily_result}"

    def _setup_tools(self) -> List:
        """Setup all tools for the place search tool"""
        @tool
        def search_attractions(place:str) -> str:
            """Search attractions of a place"""
            return self._search("google_search_attractions",
                                self.tavily_search.tavily_search_attractions,
                                place, "attractions of")

        @tool
        def search_restaurants(place:str) -> str:
            """Search restaurants of a place"""
            return self._search("google_search_restaurants",
                                self.tavily_search.tavily_search_restaurants,
                                place, "restaurants of")

        @tool
        def search_activities(place:str) -> str:
            """Search activities of a place"""
            return self._search("google_search_activity",
                                self.tavily_search.tavily_search_activity,
                                place, "activities in and around")

        @tool
        def search_transportation(place:str) -> str:
            """Search transportation of a place"""
            return self._search("google_search_transportation",
                                self.tavily_search.tavily_search_transportation,
                                place, "modes of transportation available in")

        return [search_attractions, search_restaurants, search_activities, search_transportation]
