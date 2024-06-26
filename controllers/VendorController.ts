import {  Request, Response ,NextFunction } from 'express';
import { Food } from '../models';
import { VendorLoginInput, EditVendorInput, CreateFoodInput } from '../dto';
import { FindVendor } from './AdminController';
import { GenerateSignature, ValidatePassword } from '../utility';

export const VendorLogin = async (req: Request,res: Response, next: NextFunction) => {
    const { email, password } = <VendorLoginInput>req.body;

    const existingUser = await FindVendor('', email);

    if(existingUser !== null){

        const validation = await ValidatePassword(password, existingUser.password, existingUser.salt);
        if(validation){

            const signature = await GenerateSignature({
                _id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name
            })
            return res.json(signature);
        }
    }

    return res.json({'message': 'Login credential is not valid'})
}

export const GetVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;
     
    if(user){

       const existingVendor = await FindVendor(user._id);
       return res.json(existingVendor);
    }

    return res.json({'message': 'vendor Information Not Found'})
}

export const UpdateVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

    const { foodType, name, address, phone} = <EditVendorInput>req.body;
     
    if(user){

       const existingVendor = await FindVendor(user._id);

       if(existingVendor !== null){

            existingVendor.name = name;
            existingVendor.address;
            existingVendor.phone = phone;
            existingVendor.foodType = foodType;
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}

export const UpdateVendorService = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

    const { lat, lng} = req.body;
     
    if(user){

       const existingVendor = await FindVendor(user._id);

       if(existingVendor !== null){

            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            if(lat && lng){
                existingVendor.lat = lat;
                existingVendor.lng = lng;
            }
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body;
     
    if(user){

       const vendor = await FindVendor(user._id);

       if(vendor !== null){
        
            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            const food = await Food.create({
                vendorId: vendor._id,
                name: name,
                description: description,
                category: category,
                price: price,
                rating: 0,
                readyTime: readyTime,
                foodType: foodType,
                images: images
            })
            
            vendor.foods.push(food);
            const result = await vendor.save();
            return res.json(result);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
 
    if(user){

       const foods = await Food.find({ vendorId: user._id});

       if(foods !== null){
            return res.json(foods);
       }

    }
    return res.json({'message': 'Foods not found!'})
}