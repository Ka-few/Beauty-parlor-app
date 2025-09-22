from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, Customer, Stylist, Service, Booking, StylistService
from datetime import datetime
import os

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "beauty_parlour.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


CORS(app)
db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
bcrypt = Bcrypt(app)

### CUSTOMERS ###
class CustomerList(Resource):
    def get(self):
        customers = Customer.query.all()
        return [c.to_dict() for c in customers], 200

    def post(self):
        data = request.get_json()
        new_customer = Customer(name=data["name"], phone=data["phone"])
        db.session.add(new_customer)
        db.session.commit()
        return new_customer.to_dict(), 201

api.add_resource(CustomerList, "/customers")

### STYLISTS ###
class StylistList(Resource):
    def get(self):
        stylists = Stylist.query.all()
        return [s.to_dict() for s in stylists], 200

    def post(self):
        data = request.get_json()
        new_stylist = Stylist(name=data["name"], bio=data.get("bio"))
        db.session.add(new_stylist)
        db.session.commit()
        return new_stylist.to_dict(), 201

api.add_resource(StylistList, "/stylists")

### SERVICES (Full CRUD) ###
class ServiceList(Resource):
    def get(self):
        services = Service.query.all()
        return [s.to_dict() for s in services], 200

    def post(self):
        data = request.get_json()
        new_service = Service(
            title=data["title"],
            description=data.get("description"),
            base_price=data.get("base_price", 0.0)
        )
        db.session.add(new_service)
        db.session.commit()
        return new_service.to_dict(), 201

api.add_resource(ServiceList, "/services")

class ServiceDetail(Resource):
    def get(self, service_id):
        service = Service.query.get_or_404(service_id)
        return service.to_dict(), 200

    def put(self, service_id):
        service = Service.query.get_or_404(service_id)
        data = request.get_json()
        service.title = data.get("title", service.title)
        service.description = data.get("description", service.description)
        service.base_price = data.get("base_price", service.base_price)
        db.session.commit()
        return service.to_dict(), 200

    def delete(self, service_id):
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted"}, 204

api.add_resource(ServiceDetail, "/services/<int:service_id>")

### BOOKINGS ###
class BookingList(Resource):
    def get(self):
        bookings = Booking.query.all()
        return [b.to_dict() for b in bookings], 200

    def post(self):
        data = request.get_json()

        # Validate foreign keys
        customer = Customer.query.get(data.get("customer_id"))
        if not customer:
            return {"error": "Customer not found"}, 404

        service = Service.query.get(data.get("service_id"))
        if not service:
            return {"error": "Service not found"}, 404

        stylist = Stylist.query.get(data.get("stylist_id"))
        if not stylist:
            return {"error": "Stylist not found"}, 404

        try:
            preferred_date = datetime.fromisoformat(data["preferred_date"])
        except Exception:
            return {"error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}, 400

        new_booking = Booking(
            customer_id=customer.id,
            service_id=service.id,
            stylist_id=stylist.id,
            preferred_date=preferred_date,
            notes=data.get("notes")
        )

        db.session.add(new_booking)
        db.session.commit()
        return new_booking.to_dict(), 201

api.add_resource(BookingList, "/bookings")

if __name__ == "__main__":
    app.run(debug=True)
