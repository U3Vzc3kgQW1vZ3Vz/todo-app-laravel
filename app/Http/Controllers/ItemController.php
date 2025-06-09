<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse; 
class ItemController extends Controller
{
    public function index(): JsonResponse
    {
        if (Auth::check()) {
            
            $items = Item::where('user_id', Auth::id())
                        ->orderBy('created_at', 'DESC')
                        ->get();
            return response()->json($items);
        }

        return response()->json(['message' => 'Not logged in'], 401);
     }

    public function store(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $validatedData = $request->validate([
                'item.name' => 'required|string|max:255',
            ]);

            $newItem = new Item();
            $newItem->name = $validatedData['item']['name'];
            $newItem->user_id = Auth::id(); 
            $newItem->save();

            return response()->json($newItem, 201); 
        }

        return response()->json(['message' => 'Not logged in'], 401);
     }

    public function update(Request $request, string $id): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Not logged in'], 401); 
         }

        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404); 
           }

        if ($item->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized to update this item'], 403);
         }

        $validatedData = $request->validate([
            'item.name' => 'nullable|string|max:255',
            'item.completed' => 'nullable|boolean',
        ]);

        if (isset($validatedData['item']['completed'])) {
            $item->completed = $validatedData['item']['completed'];
            $item->completed_at = $item->completed ? Carbon::now() : null;
        }

        if (isset($validatedData['item']['name'])) {
            $item->name = $validatedData['item']['name'];
        }

        $item->save();

        return response()->json($item);
    }

    public function destroy(string $id): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Not logged in'], 401);
        }

        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404); 
        }

        if ($item->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized to delete this item'], 403); 
        }

        $item->delete();

        return response()->json(['message' => "Item {$id} deleted"], 200);
    }

    public function create()
    {
        //
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }
}