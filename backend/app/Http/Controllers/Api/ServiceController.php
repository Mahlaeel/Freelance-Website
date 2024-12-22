<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() // (get) http://127.0.0.1:8000/api/services
    {
        $this->authorize('viewAny', Service::class);

        $services = Service::with(['user', 'category'])
        ->get();

        return response()->json([
            'success' => true,
            'services' => $services
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) // (post) http://127.0.0.1:8000/api/services
    {
        $this->authorize('create', Service::class);

        $request->validate([
            'title' => 'required | min:4 | max:255',
            'description' => 'required | min:10',
            'price' => 'required | numeric',
            'images' => 'nullable',
            'user_id' => 'required',
            'category_id' => 'required',
            'seller_note' => 'string | min:10',
            'duration' => 'string'
        ]);

        $service = Service::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'images' => $request->images,
            'user_id' => $request->user_id,
            'category_id' => $request->category_id,
            'seller_note' => $request->seller_note,
            'duration' => $request->duration
        ]);

        return response()->json([
            'message' => 'Services Created successfully!',
            'service' => $service
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service) // (get) http://127.0.0.1:8000/api/services/{service}
    {
        $this->authorize('view', $service);

        $serv = Service::where('id','=', $service->id)
        ->with(['user', 'category'])
        ->get();

        return response()->json([
            'success' => true,
            'service' => $serv
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service) // (put) http://127.0.0.1:8000/api/services/{service}
    {

        $serv = Service::find($service->id);

        $this->authorize('update', $serv);

        if(!$serv){
            return response()->json([
                'message' => 'Service not found'
        ], 404);
        }
        $request->validate([
            'title' => 'required | min:4 | max:255',
            'description' => 'required | min:10',
            'price' => 'required',
            'images' => 'nullable',
            'user_id' => 'required',
            'category_id' => 'required',
            'seller_note' => 'string | min:10'
        ]);

        $serv->update([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'images' => $request->images,
            'user_id' => $request->user_id,
            'category_id' => $request->category_id,
            'seller_note' => $request->seller_note
        ]);

        // $serv->save();

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $serv
        ], 200);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service) // (delete) http://127.0.0.1:8000/api/services/{service}
    {

        $serv = Service::find($service->id);
        $this->authorize('delete', $serv);

        if(!$serv) {
            return response()->json([
                'message' => 'the service not found'
            ], 404);
        }

        $serv->delete();

        return response()->json([
            'message' => 'the service deleted successfully!'
        ], 200);

    }
}
