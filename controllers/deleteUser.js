const client = require("../dbConfig");

module.exports.deleteUser=async(req,res)=>{
    const userIds=req.body.usersIds;
    try{
        await client.query(`DELETE FROM users WHERE id=ANY($1);`,[userIds]);
        res.status(200).json({error:'Users have been deleted.'})
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Failed to delete selected users from database.'})
    }

}