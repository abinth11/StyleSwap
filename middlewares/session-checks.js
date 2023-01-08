module.exports={
    adminCheck:(req,res,next)=>{
        console.log(req.session.admin);
        if(req.session.admin){
            res.redirect('/admin')
        }else{
            next();    
        }

    },
    userCheck:(req,res,next)=>{

    }
}