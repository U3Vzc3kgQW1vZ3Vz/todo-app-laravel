<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

use function Symfony\Component\Clock\now;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Item::orderBy('created_at','DESC')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $new_item= new Item();
        $new_item->name=$request->item['name'];
        $new_item->save();
        return $new_item;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $request_item=Item::find($id);
        if($request_item){
            $request_item->completed=$request->item['completed']??false;
            $request_item->completed_at=($request->item['completed']??false)?Carbon::now():null;
            $request_item->save();
            return $request_item;
        }
        return "Item not found";
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $request_item=Item::find($id);
        if($request_item){
            $request_item->delete();
            return "Item {$id} deleted";
        }
        return "Item not available";
        //
    }
}
